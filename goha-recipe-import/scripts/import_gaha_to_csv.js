// scripts/export_goha_combined_content.js

/**
 * all1.html ～ all6.html のインデックスページから
 * 各レシピページ (recipeXXX.html) の .content 要素を抽出し、
 * ひとつの HTML ファイルにまとめて保存するスクリプト
 *
 * 実行方法:
 *   npm install node-fetch@2 cheerio
 *   node scripts/export_goha_combined_content.js
 */

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const BASE_URL = "https://www.maff.go.jp/j/seisan/kakou/mezamasi/recipe";
const INDEX_PAGES = [1, 2, 3, 4, 5, 6].map((i) => `${BASE_URL}/all${i}.html`);
const OUTPUT_DIR = path.resolve(process.cwd(), "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "combined_recipe_contents.html");

async function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

async function extractRecipeLinks(indexHtml) {
  const $ = cheerio.load(indexHtml);
  return $("a")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter((href) =>
      /^\/j\/seisan\/kakou\/mezamasi\/recipe\/recipe\d+\.html$/.test(href)
    )
    .map((href) => `https://www.maff.go.jp${href}`);
}

async function main() {
  await ensureOutputDir();

  const combinedParts = [];

  for (const indexUrl of INDEX_PAGES) {
    console.log(`Processing index page: ${indexUrl}`);
    const indexHtml = await fetchHtml(indexUrl);
    const recipeUrls = await extractRecipeLinks(indexHtml);

    for (const recipeUrl of recipeUrls) {
      try {
        console.log(`  Fetching recipe: ${recipeUrl}`);
        const html = await fetchHtml(recipeUrl);
        const $ = cheerio.load(html);
        const contentHtml = $(".content").html();
        if (!contentHtml) {
          console.warn(`  .content not found in ${recipeUrl}`);
          continue;
        }
        // 取得ファイル名（例: recipe0290.html）
        const filename = recipeUrl.split("/").pop();
        // ヘッダーコメントと共に追加
        combinedParts.push(`<!-- START ${filename} -->`);
        combinedParts.push(`<div class="content" data-source="${filename}">`);
        combinedParts.push(contentHtml);
        combinedParts.push(`</div>`);
        combinedParts.push(`<!-- END ${filename} -->\n`);
      } catch (err) {
        console.error(`  Error processing ${recipeUrl}:`, err.message);
      }
    }
  }

  // 結合して一つのファイルに書き出し
  const finalHtml = [
    "<!DOCTYPE html>",
    '<html lang="ja"><head><meta charset="UTF-8"><title>Combined Recipe Contents</title></head><body>',
    combinedParts.join("\n"),
    "</body></html>",
  ].join("\n");

  fs.writeFileSync(OUTPUT_FILE, finalHtml, "utf-8");
  console.log(
    `\n✅ All recipe contents have been combined into:\n  ${OUTPUT_FILE}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
