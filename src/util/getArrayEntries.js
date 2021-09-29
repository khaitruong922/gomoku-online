export default function getArrayEntries(obj) {
    if (!obj) return []
    const array = Object.entries(obj).map(item => ({ ...item[1], id: Number(item[0]) }))
    return array;
}