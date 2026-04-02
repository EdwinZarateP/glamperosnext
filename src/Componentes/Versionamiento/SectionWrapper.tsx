import VersionSwitcher from "./VersionSwitcher";

interface Props {
  sectionId: string;
  children: React.ReactNode;
  labels?: string[];
}

export default function SectionWrapper({ sectionId, children, labels }: Props) {
  return (
    <div style={{ position: "relative", background: "var(--crema)" }}>
      <VersionSwitcher
        sectionId={sectionId}
        labels={labels}
      />
      {children}
    </div>
  );
}