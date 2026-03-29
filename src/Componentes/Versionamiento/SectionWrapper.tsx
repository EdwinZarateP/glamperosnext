import VersionSwitcher from "./VersionSwitcher";

interface Props {
  sectionId: string;
  // totalVersions: number;  // ← recibe el total explícitamente
  children: React.ReactNode;
  labels?: string[];
}

// export default function SectionWrapper({ sectionId, totalVersions, children, labels }: Props) {
export default function SectionWrapper({ sectionId, children, labels }: Props) {
  return (
    // <div style={{ position: "relative" }}>
    //   <VersionSwitcher
    //     sectionId={sectionId}
    //     totalVersions={totalVersions}
    //     labels={labels}
    //   />
    //   {children}
    // </div>
    <div style={{ position: "relative", background: "var(--crema)" }}>
      <VersionSwitcher
        sectionId={sectionId}
        labels={labels}
      />
      {children}
    </div>
  );
}