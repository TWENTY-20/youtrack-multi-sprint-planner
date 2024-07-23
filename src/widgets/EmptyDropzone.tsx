import { useDroppable } from "@dnd-kit/core";

export default function EmptyDropzone({ id }: { id: string }) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div ref={setNodeRef} className="min-h-10 w-full">
        </div>
    );
}
