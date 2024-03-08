// import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	// if (params.slug === 'hello-world') {
		return {
      id: params.slug,
			// title: 'Hello world!',
			// content: 'Welcome to our blog. Lorem ipsum dolor sit amet...'
		};
	// }

	// error(404, 'Not found');
}