import MarkdownEditor from "@/components/MarkdownEditor";

export default function Documentation() {
    return (
        <main className="flex-1 bg-white dark:bg-gray-800 h-full rounded-lg shadow-lg flex flex-col overflow-hidden lg:ml-64">
            <MarkdownEditor />
        </main>
    );
}