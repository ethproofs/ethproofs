export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto mt-3 flex max-w-screen-xl flex-1 flex-col items-center gap-20 px-6 [&>section]:w-full">
      {children}
    </div>
  )
}
