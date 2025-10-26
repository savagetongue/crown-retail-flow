import { useEffect } from "react";
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
import { Tables } from "@/integrations/supabase/types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Tables<"categories"> | null;
};

export default function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [category, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (category) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: values.name,
            description: values.description || null,
          })
          .eq("id", category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert([{
          name: values.name,
          description: values.description || null,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: category ? "Category updated" : "Category created",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Failed to save category",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Shirts" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Brief description" />
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
                {mutation.isPending ? "Saving..." : category ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
