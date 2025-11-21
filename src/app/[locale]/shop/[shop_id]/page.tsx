// export async function generateStaticParams() {
//   const posts = await fetch('https://.../posts').then((res) => res.json())
 
//   return posts.map((post: any) => ({
//     slug: post.slug,
//   }))
// }
 
export default async function Page({
  params,
}: {
  params: Promise<{ shop_id: string }>
}) {
  const { shop_id } = await params

  return(
    <>{shop_id}</>
  )
  // ...
}