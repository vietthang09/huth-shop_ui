import BlogsSessionProvider from "./sessionProvider";

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <BlogsSessionProvider>{children}</BlogsSessionProvider>;
}
