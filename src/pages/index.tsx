import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";
import Link from "next/link";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>DD Gaming</title>
        <meta
          name="description"
          content="DD Gaming"
        />
      </Head>
      <HomeView />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>

      </div>
    </div>
  );
};

export default Home;
