import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/artigos")({
  component: ArtigosLayout,
});

function ArtigosLayout() {
  return <Outlet />;
}
