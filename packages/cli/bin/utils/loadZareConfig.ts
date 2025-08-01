import { cosmiconfig } from 'cosmiconfig';

interface IZareConfig {
    port: number,
    static: string,
    outdir: string,
    pages: string,
    tailwind: boolean,
}

export async function loadZareConfig(searchFrom: string): Promise<IZareConfig> {
    const explorer = cosmiconfig('zare', {
        searchPlaces: [
            'zare.config.js',
            'zare.config.cjs',
            'zare.config.mjs',
            '.zarerc',
            '.zarerc.json'
        ],
    });

    const result = await explorer.search(searchFrom);

    if (!result || result.isEmpty) {
        throw new Error('no zare configuration found');
    }

    const configs = await result.config;

    return {
        port: configs.port || 8185,
        static: configs.static || "./static",
        outdir: configs.outdir || "./dist",
        pages: configs.pages || "./pages",
        tailwind: configs.tailwind || false,
    }
}
