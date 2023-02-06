
export const setFRFailedCount = (identifier: string, count: number) => {
    localStorage.setItem(identifier, count.toString());
}

export const getFRFailedCount = (identifier: string) => {
    const value = parseInt(localStorage.getItem(identifier) as string) 
    return isNaN(value) ? 0 : value
}

export const resetFRFailedCount = (identifier: string) => {
    localStorage.setItem(identifier, "0");
}