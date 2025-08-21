function topColor(i: number) {
    const colors = ["var(--indigo)", "var(--coral)", "var(--mint)", "var(--amber)"];
    return colors[i % colors.length];
    }
export default topColor;