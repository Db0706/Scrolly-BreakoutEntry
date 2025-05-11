import type { NextPage } from "next";
import Head from "next/head";
import CreateNewUserWithProfile from "../../pages/profile"; // Adjust the import path

const Basics: NextPage = () => {
  return (
    <div className="profile-page">
      <Head>
        <title>Player Profile</title>
        <meta name="description" content="Player Profile Page" />
      </Head>

      {/* Header */}
      <header className="header">
        <h1>Player Profile</h1>
      </header>

      {/* Profile Component */}
      <main>
        <CreateNewUserWithProfile /> {/* Profile section */}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 DD Studios</p>
      </footer>

      <style jsx>{`
        .profile-page {
          font-family: 'Arial', sans-serif;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-image: url('/profile-bg.jpg'); /* Replace with your background image */
          background-size: cover;
        }

        .header {
          padding: 20px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          text-align: center;
          border-bottom: 2px solid #ffd700;
        }

        .footer {
          padding: 20px;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.8);
          color: #ffd700;
          border-top: 2px solid #ffd700;
          margin-top: auto;
        }

        main {
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default Basics;
