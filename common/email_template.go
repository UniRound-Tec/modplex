package common

import (
	"html"
	"strconv"
	"strings"
)

// Nothing-design branded HTML email templates (Modplex).
// Monochrome, table-based, inline-styled for broad mail-client compatibility.
// Space Mono / Space Grotesk load via <link>; clients that block web fonts
// fall back to system monospace / sans, which keeps the nothing-design voice.

const emailFontMono = "'Space Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"
const emailFontSans = "'Space Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"

// renderBrandEmail wraps a hero + meta fragment in the shared Modplex chrome
// (red-square brand header, dividers, uppercase-mono footer). eyebrow and intro
// are plain text (HTML-escaped here); hero and meta are trusted HTML fragments
// built by the callers below.
func renderBrandEmail(eyebrow, intro, hero, meta string) string {
	name := html.EscapeString(SystemName)
	var b strings.Builder
	b.WriteString(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">`)
	b.WriteString(`<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"></head>`)
	b.WriteString(`<body style="margin:0;padding:0;background:#E5E4E0;">`)
	b.WriteString(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E5E4E0;padding:40px 16px;"><tr><td align="center">`)
	b.WriteString(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#F5F4F1;border:1px solid rgba(0,0,0,0.14);">`)

	// header: red square + brand name
	b.WriteString(`<tr><td style="padding:28px 32px 20px 32px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>`)
	b.WriteString(`<td style="width:11px;height:11px;background:#D71921;font-size:0;line-height:0;">&nbsp;</td>`)
	b.WriteString(`<td style="padding-left:10px;font-family:` + emailFontMono + `;font-size:13px;letter-spacing:0.22em;color:#1A1A1A;text-transform:uppercase;">` + name + `</td>`)
	b.WriteString(`</tr></table></td></tr>`)

	// divider
	b.WriteString(`<tr><td style="padding:0 32px;"><div style="border-top:1px solid rgba(0,0,0,0.12);font-size:0;line-height:0;">&nbsp;</div></td></tr>`)

	// eyebrow + intro
	b.WriteString(`<tr><td style="padding:36px 32px 8px 32px;">`)
	b.WriteString(`<div style="font-family:` + emailFontMono + `;font-size:11px;letter-spacing:0.28em;color:rgba(0,0,0,0.45);text-transform:uppercase;">` + eyebrow + `</div>`)
	b.WriteString(`<div style="font-family:` + emailFontSans + `;font-size:15px;font-weight:400;color:rgba(0,0,0,0.62);line-height:1.55;padding-top:14px;">` + html.EscapeString(intro) + `</div>`)
	b.WriteString(`</td></tr>`)

	// hero (code box or reset button)
	b.WriteString(hero)

	// meta block (validity + ignore note)
	b.WriteString(meta)

	// footer
	b.WriteString(`<tr><td style="padding:0 32px;"><div style="border-top:1px solid rgba(0,0,0,0.12);font-size:0;line-height:0;">&nbsp;</div></td></tr>`)
	b.WriteString(`<tr><td style="padding:18px 32px 26px 32px;"><div style="font-family:` + emailFontMono + `;font-size:10px;letter-spacing:0.2em;color:rgba(0,0,0,0.38);text-transform:uppercase;">` + name + `&nbsp;·&nbsp;AUTOMATED&nbsp;MESSAGE&nbsp;·&nbsp;DO&nbsp;NOT&nbsp;REPLY</div></td></tr>`)

	b.WriteString(`</table></td></tr></table></body></html>`)
	return b.String()
}

// emailValidityMeta renders the shared "VALID FOR N MIN" + ignore-note block.
func emailValidityMeta(ignoreNote string) string {
	mins := strconv.Itoa(VerificationValidMinutes)
	var b strings.Builder
	b.WriteString(`<tr><td style="padding:16px 32px 40px 32px;">`)
	b.WriteString(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>`)
	b.WriteString(`<td style="font-family:` + emailFontMono + `;font-size:11px;letter-spacing:0.16em;color:rgba(0,0,0,0.45);text-transform:uppercase;">VALID&nbsp;FOR</td>`)
	b.WriteString(`<td align="right" style="font-family:` + emailFontMono + `;font-size:11px;letter-spacing:0.16em;color:#1A1A1A;">` + mins + `&nbsp;MIN</td>`)
	b.WriteString(`</tr></table>`)
	b.WriteString(`<div style="font-family:` + emailFontSans + `;font-size:13px;color:rgba(0,0,0,0.45);line-height:1.5;padding-top:14px;">` + html.EscapeString(ignoreNote) + `</div>`)
	b.WriteString(`</td></tr>`)
	return b.String()
}

// RenderVerificationCodeEmail builds the email-verification message body.
func RenderVerificationCodeEmail(code string) string {
	hero := `<tr><td style="padding:26px 32px 6px 32px;">` +
		`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(0,0,0,0.16);background:#FFFFFF;">` +
		`<tr><td align="center" style="padding:22px 12px;font-family:` + emailFontMono + `;font-size:42px;font-weight:700;letter-spacing:0.42em;color:#111111;text-indent:0.42em;">` + html.EscapeString(code) + `</td></tr>` +
		`</table></td></tr>`
	meta := emailValidityMeta("若非本人操作，请忽略此邮件，验证码将自动失效。")
	return renderBrandEmail("EMAIL&nbsp;VERIFICATION", "您好，您正在进行 "+SystemName+" 邮箱验证。请在下方输入验证码完成操作。", hero, meta)
}

// RenderPasswordResetEmail builds the password-reset message body. link is the
// full reset URL; it is rendered both as a button and as copyable text.
func RenderPasswordResetEmail(link string) string {
	safeLink := html.EscapeString(link)
	hero := `<tr><td style="padding:26px 32px 6px 32px;">` +
		`<table role="presentation" cellpadding="0" cellspacing="0"><tr>` +
		`<td style="background:#111111;"><a href="` + safeLink + `" style="display:inline-block;padding:14px 28px;font-family:` + emailFontMono + `;font-size:12px;letter-spacing:0.22em;color:#FFFFFF;text-decoration:none;text-transform:uppercase;">RESET&nbsp;PASSWORD&nbsp;→</a></td>` +
		`</tr></table>` +
		`<div style="font-family:` + emailFontMono + `;font-size:11px;letter-spacing:0.02em;color:rgba(0,0,0,0.42);line-height:1.6;padding-top:18px;word-break:break-all;">若按钮无法点击，请复制以下链接到浏览器打开：<br>` + safeLink + `</div>` +
		`</td></tr>`
	meta := emailValidityMeta("若非本人操作，请忽略此邮件，重置链接将自动失效。")
	return renderBrandEmail("PASSWORD&nbsp;RESET", "您好，您正在进行 "+SystemName+" 密码重置。请点击下方按钮继续。", hero, meta)
}
