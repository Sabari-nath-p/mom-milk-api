import { inline } from "@css-inline/css-inline";
import { TemplateAdapter, MailerOptions } from "@nestjs-modules/mailer";
import { basename, dirname, extname, isAbsolute, join } from "path";
import { renderFile } from "pug";

type PugAdapterConfig = {
  inlineCssEnabled?: boolean;
  inlineCssOptions?: Record<string, any>;
};

export class PugAdapter implements TemplateAdapter {
  private readonly inlineCssEnabled: boolean;
  private readonly inlineCssOptions: Record<string, any>;

  constructor(config: PugAdapterConfig = {}) {
    this.inlineCssEnabled = config.inlineCssEnabled ?? true;
    this.inlineCssOptions = config.inlineCssOptions ?? {};
  }

  compile(
    mail: any,
    callback: (err?: any, body?: string) => any,
    options: MailerOptions,
  ): void {
    const template: string | undefined = mail?.data?.template;
    const context = mail?.data?.context ?? {};

    if (!template) {
      callback(new Error("Missing mail.data.template"));
      return;
    }

    const configuredTemplateDir = (options as any)?.template?.dir ?? "";
    const configuredOptions = (options as any)?.template?.options ?? {};

    const extension = extname(template) || ".pug";
    const templateBaseName = basename(template, extname(template));

    const templateDirectory = isAbsolute(template)
      ? dirname(template)
      : join(configuredTemplateDir, dirname(template));

    const templatePath = join(
      templateDirectory,
      `${templateBaseName}${extension}`,
    );

    renderFile(
      templatePath,
      { ...context, ...configuredOptions },
      (err, html) => {
        if (err) {
          callback(err);
          return;
        }

        try {
          mail.data.html = this.inlineCssEnabled
            ? inline(html, this.inlineCssOptions)
            : html;
          callback();
        } catch (e) {
          callback(e);
        }
      },
    );
  }
}
