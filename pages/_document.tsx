import Document, { Html, Head, Main, NextScript } from "next/document";

/**
 * Use <Script> Component instead of <script> tag.
 * Unfortunately you can't use the next/script component inside the _document.js page,
 * for global script use it inside _app.js page instead.
 * see:
 * - https://nextjs.org/docs/messages/no-sync-scripts
 * - https://nextjs.org/docs/messages/no-script-in-document-page#why-this-error-occurred
 */
class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Aguafina+Script&family=Allan&family=Architects+Daughter&family=Berkshire+Swash&family=Give+You+Glory&family=Miss+Fajardose&family=Poppins:wght@200;300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
