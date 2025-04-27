export const createForgotTemplate = (
  link: string,
  mainColor: string,
  logo: string,
  logoWidth: number | string
) => `<!DOCTYPE html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <title>Embedsy</title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
      .ReadMsgBody {
        width: 100%;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass * {
        line-height: 100%;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css">
      @media only screen and (max-width: 480px) {
        @-ms-viewport {
          width: 320px;
        }
        @viewport {
          width: 320px;
        }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if lte mso 11]>
      <style type="text/css">
        .outlook-group-fix {
          width: 100% !important;
        }
      </style>
    <![endif]-->
    <!--[if !mso]><!-->
    <link
      href="http://db.onlinewebfonts.com/c/1dc8ecd8056a5ea7aa7de1db42b5b639?family=Gilroy"
      rel="stylesheet"
      type="text/css"
    />
    <style type="text/css">
      @import url(http://db.onlinewebfonts.com/c/1dc8ecd8056a5ea7aa7de1db42b5b639?family=Gilroy);
    </style>
    <!--<![endif]-->
    <style type="text/css">
      @media only screen and (min-width: 480px) {
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      }
    </style>
    <style type="text/css">
      @media only screen and (max-width: 480px) {
        table.full-width-mobile {
          width: 100% !important;
        }
        td.full-width-mobile {
          width: auto !important;
        }
      }
    </style>
    <style type="text/css">
      p {email
        margin: 0;
      }
      a {
        text-decoration: none;
      }
      btn {
        background-color: grey;
      }
    </style>
  </head>
  <body>
    <div
      style="
        display: none;
        font-size: 1px;
        color: #ffffff;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      Embedsy
    </div>
    <div>
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="background: #ffffff; background-color: #ffffff; margin: 0px auto; max-width: 600px"
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #ffffff; background-color: #ffffff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: left;
                  vertical-align: top;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div
                  class="mj-column-per-100 outlook-group-fix"
                  style="
                    font-size: 13px;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tr>
                      <td
                        align="center"
                        style="font-size: 0px; padding: 10px 25px; word-break: break-word;"
                      >
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="border-collapse: collapse; border-spacing: 0px"
                        >
                          <tbody>
                            <tr>
                              <td style="width: ${logoWidth}px">
                                <img
                                  alt="Logo"
                                  height="auto"
                                  src="${logo}"
                                  style="
                                    border: 0;
                                    display: block;
                                    outline: none;
                                    text-decoration: none;
                                    height: auto;
                                    width: 100%;
                                  "
                                  width=" ${logoWidth}"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="background: #ffffff; background-color: #ffffff; margin: 0px auto; max-width: 600px"
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #ffffff; background-color: #ffffff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                  vertical-align: top;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div
                  class="mj-column-per-100 outlook-group-fix"
                  style="
                    font-size: 13px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tr>
                      <td
                        align="center"
                        style="font-size: 0px; padding: 0 24px; word-break: break-word"
                      >
                        <div
                          style="
                            font-family: Gilroy, Helvetica, Arial, sans-serif, Arial, sans-serif;
                            font-size: 13px;
                            line-height: 1;
                            text-align: center;
                            color: #000000;
                          "
                        >
                          <h1 style="font-size: 24px">
                            Password Recovery
                          </h1>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="background: #ffffff; background-color: #ffffff; margin: 0px auto; max-width: 600px"
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #ffffff; background-color: #ffffff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                  vertical-align: top;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div
                  class="mj-column-per-100 outlook-group-fix"
                  style="
                    font-size: 13px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tr>
                      <td
                        align="left"
                        style="font-size: 0px; padding: 0 48px; word-break: break-word"
                      >
                        <div
                          style="
                            font-family: Gilroy, Helvetica, Arial, sans-serif, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 22px;
                            text-align: left;
                            color: #000000;
                          "
                        >
                         To recover your password, please follow the link to the recovery page
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="background: #ffffff; background-color: #ffffff; margin: 0px auto; max-width: 600px"
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #ffffff; background-color: #ffffff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 0;
                  text-align: center;
                  vertical-align: top;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div
                  class="mj-column-per-100 outlook-group-fix"
                  style="
                    font-size: 13px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tr>
                      <td
                        align="center"
                        vertical-align="middle"
                        class="btn"
                        style="font-size: 0px; padding: 10px 25px; word-break: break-word"
                      >
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="border-collapse: separate; width: 202px; line-height: 100%"
                        >
                          <tr>
                            <td
                              align="center"
                              bgcolor="${mainColor}"
                              role="presentation"
                              style="
                                border: none;
                                border-radius: 6px;
                                cursor: auto;
                                padding: 10px 25px;
                                background: ${mainColor};
                              "
                              valign="middle"
                            >
                              <a
                                href=${link}
                                style="
                                  background: ${mainColor};
                                  color: #ffffff;
                                  font-family: Raleway, Helvetica;
                                  font-size: 13px;
                                  font-weight: 600;
                                  line-height: 120%;
                                  margin: 0;
                                  text-decoration: none;
                                  text-transform: none;
                                "
                                target="_blank"
                                >Restore password</a
                              >
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="background: #ffffff; background-color: #ffffff; margin: 0px auto; max-width: 600px"
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #ffffff; background-color: #ffffff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                  vertical-align: top;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div
                  class="mj-column-per-100 outlook-group-fix"
                  style="
                    font-size: 13px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tr>
                      <td
                        align="left"
                        style="font-size: 0px; padding: 0 48px 48px; word-break: break-word"
                      >
                        <div
                          style="
                            font-family: Gilroy, Helvetica, Arial, sans-serif, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 22px;
                            text-align: left;
                            color: #000000;
                          "
                        >
                          If you didn't request this email, you can safely ignore it &#128521;
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><![endif]-->
    </div>
  </body>
</html>
`
