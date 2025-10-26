import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CategoryDialog from "@/components/categories/CategoryDialog";
import { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

export default function Categories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage product categories
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setDialogOpen(true);
          }}
          className="rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : categories?.length === 0 ? (
        <Card className="p-8 text-center rounded-2xl">
          <p className="text-muted-foreground">No categories yet. Create your first one!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category) => (
            <Card key={category.id} className="p-6 rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCategory(category);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this category?")) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />
    </div>
  );
}
