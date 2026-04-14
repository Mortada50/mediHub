import { LoaderIcon } from "lucide-react";
import React from "react";

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon className="size-12 animate-spin text-primary" />
    </div>
  );
};

export default PageLoader;
