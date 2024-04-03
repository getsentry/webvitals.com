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
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Block />
    );
}
