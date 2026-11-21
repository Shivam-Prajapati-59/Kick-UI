import type { Metadata } from "next";
import FolderCard from "./FolderCard";

export const metadata: Metadata = {
  title: "Playground",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlaygroundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-wrap items-center justify-center gap-[30px]">
      <FolderCard
        number="01"
        title="Simple and easy to use"
        description="Fully customize to suit your needs"
        objectSrc="/assets/nfts/noun-7.svg"
        frameColor="#010026"
        folderColor="#04004a"
        textColor="#ffffff"
        background="linear-gradient(135deg,#7c5cff 0%,#2b1bd1 60%,#1a0f8f 100%)"
      />
      <FolderCard
        number="02"
        title="Number two for example"
        description="The description of the second example is still easy to add"
        objectSrc="/assets/nfts/noun-77.svg"
        frameColor="#c1cfde"
        folderColor="#e4e7ed"
        textColor="#121212"
        background="linear-gradient(135deg,#ff7a18 0%,#e0312b 40%,#1b1b3a 100%)"
      />
      <FolderCard
        number="03"
        title="The third number, which shows ease of use"
        description="This description needs to be made larger to show how easily the space can be filled."
        objectSrc="/assets/nfts/noun-420.svg"
        frameColor="#020405"
        folderColor="#101b21"
        textColor="#ffffff"
        background="radial-gradient(120% 80% at 50% 0%,#9cc3e6 0%,#3a5a73 35%,#020405 75%)"
      />
    </div>
  );
}
