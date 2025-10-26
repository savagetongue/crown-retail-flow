import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required").max(500),
});

type StockAdjustDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: any;
  type: "add" | "subtract";
};

export default function StockAdjustDialog({
  open,
  onOpenChange,
  stock,
  type,
}: StockAdjustDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      reason: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const change = type === "add" ? values.quantity : -values.quantity;
      const newQuantity = stock.quantity + change;

      if (newQuantity < 0) {
        throw new Error("Cannot reduce stock below zero");
      }

      const { error: updateError } = await supabase
        .from("product_stock")
        .update({
          quantity: newQuantity,
          last_movement_at: new Date().toISOString(),
        })
        .eq("id", stock.id);

      if (updateError) throw updateError;

      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert([
          {
            product_id: stock.product_id,
            location_id: stock.location_id,
            change,
            reason: values.reason,
          },
        ]);

      if (movementError) throw movementError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast({ title: "Stock updated successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === "add" ? "Add Stock" : "Adjust Stock"}
          </DialogTitle>
        </DialogHeader>

        {stock && (
          <div className="text-sm text-muted-foreground mb-4">
            <p>Product: {stock.products?.name}</p>
            <p>Current Quantity: {stock.quantity}</p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g., New stock arrival, Damaged goods, etc."
                    />
                  </FormControl>
                  <FormMessage />
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
                {mutation.isPending ? "Updating..." : "Update Stock"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
