export default function clone2D(arr = []) {
    return arr.map(inner => [...inner])
}