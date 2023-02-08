const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const moment = require('moment');
const path = require('path');
const fs = require('fs');
// or
// import {NotionToMarkdown} from "notion-to-md";

const notion = new Client({
	auth: process.env.NOTION_TOKEN,
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {


	const databaseId = process.env.DATABASE_ID;
	// TODO has_more
	const response = await notion.databases.query({
		database_id: databaseId,
		filter: {
			property: "Publish",
			checkbox: {
				equals: true
			}
		}
	})
	for (const r of response.results) {
		console.log(r)
		const id = r.id
        
        
		// title
		let title = id
		let ptitle = r.properties?.['Name']?.['title']
		if (ptitle?.length > 0) {
			title = ptitle[0]?.['plain_text']
        }
        
		// tags
		let tags = []
		let pelementos = r.properties?.['Tags']?.['multi_select']
		for (const t of pelementos) {
			const n = t?.['name']
			if (n) {
				tags.push(n.toLowerCase())
			}
        }

        let t = '[' + tags.toString() + ']'


        // Categoría
       let cat = ''
       let pcats = r.properties?.['Category']?.['multi_select']
       cat = pcats[0]?.['name']

       let nav = cat.toLowerCase();

        // Permalink
		let permalink = ''
		let ppermalink = r.properties?.['Permalink']?.['formula']
		permalink = ppermalink?.['string']

		// Slug
		let slug = ''
		let pslug = r.properties?.['Slug']?.['formula']
		slug = pslug?.['string']

        
const fm = `---
title: ${title}
permalink: ${permalink}
tags: ${t}
---
`
		const mdblocks = await n2m.pageToMarkdown(id);
        const md = n2m.toMarkdownString(mdblocks);
        
        // ensure directory exists
	    const root = '_' + nav
	    fs.mkdirSync(root, { recursive: true })

		//writing to file
		const ftitle = `${slug}.md`
		fs.writeFile(path.join(root, ftitle), fm + md, (err) => {
			if (err) {
				console.log(err);
			}
		});
	}
})();