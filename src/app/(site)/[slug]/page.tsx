import { PortableText } from "@portabletext/react";
import { getPage } from "../../../../sanity/utils/page";

type Props = {
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const page = await getPage(params.slug);

  return (
    <div>
      <h1 className="bg-gradient-to-r from-[#EB725A] via-[#EF4168] to-[#81CCA5] bg-clip-text text-transparent text-5xl drop-shadow font-extrabold">
        {page.title}
      </h1>

      <div className="text-lg text-gray-700 dark:text-white mt-10">
        <PortableText value={page.content} />
      </div>
    </div>
  );
}
