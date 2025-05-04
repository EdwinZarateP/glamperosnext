import FiltersComponent from "../../Componentes/Filter/index";

interface Props {
  params: {
    slug?: string[];
  };
}

export default function GlampingsSlugPage({ params }: Props) {
  return (
    <div>
      <h1 style={{ margin: "1rem 0" }}>Filtros activos</h1>
      <FiltersComponent slug={params.slug} />
    </div>
  );
}
