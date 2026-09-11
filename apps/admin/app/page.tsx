"use client";

import { useQuery } from "@tanstack/react-query";

import { privateHttp } from "./api/http";

const Page = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["test"],
    queryFn: () => privateHttp.get<string>("/users/test"),
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Home Page</h1>

      <pre className="rounded-lg border p-4">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default Page;
