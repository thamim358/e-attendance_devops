export const classNames = (...classes) => {
    return classes.join(' ').split(/\s+/).filter(Boolean).join(' ');
}

export const profileName = (name) => {
    let result = "";
    let processedName = name ? name.split(" ") : "NA"
    processedName.length < 2 ?
        result = processedName[0].charAt(0) :
        result = processedName[0].charAt(0) + processedName[1].charAt(0);
    return result.toUpperCase();
};