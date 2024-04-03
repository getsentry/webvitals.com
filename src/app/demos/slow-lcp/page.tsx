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
            <div className="w-48 h-48 bg-lime-500"></div>
        </div>
    );
}

export default function Page() {
    return (
        <main>
            <h1>fcp demo</h1>
            <Block />
        </main >
    );
}
