export const checkValidEmail = (email) => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
};

export const validRequired = (state, setState) => {
    if (state.value === "") {
        setState({ value: "", valid: false });
    }
};

export const validEmail = (email, setEmail) => {
    if (!checkValidEmail(email))
        setEmail({ values: "", valid: false });
};

export const validPassword = (password, setPassword) => {
    if (!checkValidPassword(password))
        setPassword({ values: "", valid: false });
};

export const validConfirmPassword = (password, confirmPassword, setConfirmPassword) => {
    if (
        password !== confirmPassword ||
        confirmPassword === ""
    ) {
        setConfirmPassword({ values: "", valid: false });
    }
};


export const checkValidPassword = (password) => {
    if (!password) return false;
    return (
        password.length >= 8 &&
        password.length <= 32 &&
        !(password.toLowerCase() === password) &&
        !(password.toUpperCase() === password)
    );
};

export const fileToDataUrl = (file) => {
    if (!file) return null;
    const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const valid = validFileTypes.find((type) => type === file.type);
    if (!valid) {
        throw Error("provided file is not a png, jpg or jpeg image.");
    }

    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
};
