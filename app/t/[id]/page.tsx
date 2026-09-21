import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function TagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data: tag, error } = await supabase
    .from("tags")
    .select("destination")
    .eq("tag_id", id)
    .single();

  if (error || !tag) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <h1>Tag not found</h1>
        <p>Tag ID: {id}</p>
      </main>
    );
  }

  redirect(tag.destination);
}