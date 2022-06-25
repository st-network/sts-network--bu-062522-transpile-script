import fs from 'fs';
import Link from 'next/link';
import { basename, extname, join } from 'path';

export async function getStaticProps() {
	const apiDir = join(process.cwd(), 'api/namespace');
	const apinamespace = await fs.promises.readdir(apiDir);
	const examples = apinamespace.map((f) => basename(f, extname(f)));
	return { props: { examples } };
}

export default function Results ({ examples }) {
	return (
			<div>
				<ul>
					{examples.map((example) => (
						<li key={example}>
							<Link href={`api/namespace/${example}`}>
								<a>{example}</a>
							</Link>
						</li>
					))}
				</ul>
			</div>
	);
};
