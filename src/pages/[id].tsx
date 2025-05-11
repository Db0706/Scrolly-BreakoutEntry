// pages/[id].tsx

import { GetStaticPaths, GetStaticProps } from 'next';

type PageProps = {
  id: string;
};

const DynamicPage = ({ id }: PageProps) => {
  return <div>This is page for ID: {id}</div>;
};

// getStaticPaths is necessary for dynamic routes in static generation
export const getStaticPaths: GetStaticPaths = async () => {
  // Define the dynamic routes you want to generate at build time
  const paths = [{ params: { id: '1' } }, { params: { id: '2' } }];
  
  return {
    paths,
    fallback: false, // or 'blocking'
  };
};

// Fetch the data for the page, based on the dynamic route
export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const id = params?.id;

  return {
    props: {
      id,
    },
  };
};

export default DynamicPage;
