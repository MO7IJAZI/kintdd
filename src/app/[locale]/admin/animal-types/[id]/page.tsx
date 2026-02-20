import { getAnimalType } from "@/actions/animalTypeActions";
import AnimalTypeForm from "@/components/admin/AnimalTypeForm";
import { notFound } from "next/navigation";

export default async function EditAnimalTypePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const item = await getAnimalType(id);
  if (!item) notFound();

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Edit Animal Type</h1>
          <p>Update livestock animal category</p>
        </div>
      </div>
      <div className="card">
        <AnimalTypeForm initialData={item as any} />
      </div>
    </div>
  );
}
