export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Escape `<` so a `</script>` sequence in content can never break out.
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
