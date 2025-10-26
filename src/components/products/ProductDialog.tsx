import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { generateSKU } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { Wand2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z.string().min(1, "SKU is required").max(50),
  category_id: z.string().optional(),
  description: z.string().max(1000).optional(),
  cost_price: z.number().min(0),
  mrp: z.number().min(0),
  tax_percent: z.number().min(0).max(100),
  active: z.boolean(),
});

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: (Tables<"products"> & { categories: { name: string } | null }) | null;
};

export default function ProductDialog({
  open,
  onOpenChange,
  product,
}: ProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      category_id: "",
      description: "",
      cost_price: 0,
      mrp: 0,
      tax_percent: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id || "",
        description: product.description || "",
        cost_price: Number(product.cost_price),
        mrp: Number(product.mrp),
        tax_percent: Number(product.tax_percent),
        active: product.active ?? true,
      });
    } else {
      form.reset({
        name: "",
        sku: "",
        category_id: "",
        description: "",
        cost_price: 0,
        mrp: 0,
        tax_percent: 0,
        active: true,
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        name: values.name,
        sku: values.sku,
        category_id: values.category_id || null,
        description: values.description || null,
        cost_price: values.cost_price,
        mrp: values.mrp,
        tax_percent: values.tax_percent,
        active: values.active,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: product ? "Product updated" : "Product created",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Failed to save product",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Cotton Formal Shirt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="e.g., CFS-A1B2" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const name = form.getValues("name");
                          if (name) {
                            form.setValue("sku", generateSKU(name));
                          }
                        }}
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mrp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRP (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Product details" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable this product for sale
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : product ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
