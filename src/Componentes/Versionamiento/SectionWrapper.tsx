import VersionSwitcher from "./VersionSwitcher";

interface Props {
  sectionId: string;
  totalVersions: number;  // ← recibe el total explícitamente
  children: React.ReactNode;
  labels?: string[];
}

export default function SectionWrapper({ sectionId, totalVersions, children, labels }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <VersionSwitcher
        sectionId={sectionId}
        totalVersions={totalVersions}
        labels={labels}
      />
      {children}
    </div>
  );
}