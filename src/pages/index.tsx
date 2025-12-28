import { Button } from "flowbite-react";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Flowbite + Next.js
          </h1>
          <DarkModeToggle />
        </div>
        
        <div className="flex flex-col gap-4">
          <p className="text-gray-600 dark:text-gray-300">
            This is a Next.js app with Flowbite components and dark mode support.
          </p>
          
          <div className="flex gap-4">
            <Button color="blue">Default Button</Button>
            <Button color="dark">Dark Button</Button>
            <Button color="success">Success Button</Button>
            <Button color="failure">Failure Button</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
