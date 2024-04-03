export const dynamic = 'force-dynamic';
const revalidate = 0;

async function getBlockData() {
    var value = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ value: 'block data' });
        }, 2000);
    });

    return value;

}
async function Block() {
    const data = await getBlockData();

    return (
        <div>
            <div className="w-96 h-96 bg-lime-500">
                <h3>LCP</h3>
                <p>This block is the largest contentful paint.</p>

                {/* add some content to make this large */}
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Block />
    );
}
