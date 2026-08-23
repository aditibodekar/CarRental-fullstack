import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const { setShowLogin, axios, setToken, navigate } = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [role, setRole] = React.useState("user");

    const [aadhar, setAadhar] = React.useState(null);
    const [license, setLicense] = React.useState(null);

    const [aadharPreview, setAadharPreview] = React.useState(null);
    const [licensePreview, setLicensePreview] = React.useState(null);

    // ✅ FILE VALIDATION
    const validateFile = (file) => {
        if (!file) return false;

        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG or PDF allowed");
            return false;
        }

        if (file.size > maxSize) {
            toast.error("File must be less than 5MB");
            return false;
        }

        return true;
    };

    // ✅ HANDLE FILE CHANGE
    const handleAadharChange = (file) => {
        if (validateFile(file)) {
            setAadhar(file);
            setAadharPreview(URL.createObjectURL(file));
        }
    };

    const handleLicenseChange = (file) => {
        if (validateFile(file)) {
            setLicense(file);
            setLicensePreview(URL.createObjectURL(file));
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {

            if (state === "register") {

                if (!aadhar || !license) {
                    toast.error("Upload Aadhaar & License");
                    return;
                }

                const formData = new FormData();
                formData.append("name", name);
                formData.append("email", email);
                formData.append("password", password);
                formData.append("role", role);
                formData.append("aadhar", aadhar);
                formData.append("license", license);

                const { data } = await axios.post(`/api/user/register`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                if (data.success) {
                    navigate('/');
                    setToken(data.token);
                    localStorage.setItem('token', data.token);
                    setShowLogin(false);
                    toast.success("Registration successful!");
                    resetForm();
                } else {
                    toast.error(data.message);
                }

            } else {

                const { data } = await axios.post(`/api/user/login`, { email, password });

                if (data.success) {
                    navigate('/');
                    setToken(data.token);
                    localStorage.setItem('token', data.token);
                    setShowLogin(false);
                    toast.success("Login successful!");
                    resetForm();
                } else {
                    toast.error(data.message);
                }
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Error occurred");
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
        setAadhar(null);
        setLicense(null);
        setAadharPreview(null);
        setLicensePreview(null);
    };

    return (
        <div 
            onClick={() => setShowLogin(false)} 
            className="fixed inset-0 z-50 flex items-center bg-black/50"
        >
            <form 
                onSubmit={onSubmitHandler} 
                onClick={(e) => e.stopPropagation()} 
                className="flex flex-col gap-4 m-auto p-8 w-80 sm:w-[350px] bg-white rounded-lg max-h-[90vh] overflow-y-auto"
            >
                <p className="text-2xl font-medium text-center sticky top-0 bg-white py-2">
                    User {state === "login" ? "Login" : "Sign Up"}
                </p>

                {state === "register" && (
                    <>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="border p-2 rounded"
                            required
                        />

                        {/* ROLE */}
                        <div className="flex gap-4">
                            <label>
                                <input type="radio" value="user" checked={role === "user"} onChange={(e) => setRole(e.target.value)} />
                                User
                            </label>
                            <label>
                                <input type="radio" value="owner" checked={role === "owner"} onChange={(e) => setRole(e.target.value)} />
                                Owner
                            </label>
                        </div>

                        {/* AADHAR UPLOAD */}
                        <div>
                            <p>Aadhaar Upload</p>

                            <label className="border-2 border-dashed p-4 flex flex-col items-center cursor-pointer">
                                {!aadhar ? (
                                    <>
                                        <span className="text-3xl">📄</span>
                                        <p>Click to upload</p>
                                    </>
                                ) : (
                                    <p>{aadhar.name}</p>
                                )}

                                <input
                                    type="file"
                                    hidden
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => handleAadharChange(e.target.files[0])}
                                />
                            </label>

                            {aadharPreview && (
                                <img src={aadharPreview} className="h-20 mt-2 rounded" />
                            )}
                        </div>

                        {/* LICENSE UPLOAD */}
                        <div>
                            <p>License Upload</p>

                            <label className="border-2 border-dashed p-4 flex flex-col items-center cursor-pointer">
                                {!license ? (
                                    <>
                                        <span className="text-3xl">🪪</span>
                                        <p>Click to upload</p>
                                    </>
                                ) : (
                                    <p>{license.name}</p>
                                )}

                                <input
                                    type="file"
                                    hidden
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => handleLicenseChange(e.target.files[0])}
                                />
                            </label>

                            {licensePreview && (
                                <img src={licensePreview} className="h-20 mt-2 rounded" />
                            )}
                        </div>
                    </>
                )}

                {/* EMAIL */}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="border p-2 rounded"
                    required
                />

                {/* PASSWORD */}
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="border p-2 rounded"
                    required
                />

                <p className="text-sm">
                    {state === "login" ? (
                        <>
                            Create account?{" "}
                            <span onClick={() => setState("register")} className="text-blue-500 cursor-pointer">
                                Click here
                            </span>
                        </>
                    ) : (
                        <>
                            Already have account?{" "}
                            <span onClick={() => setState("login")} className="text-blue-500 cursor-pointer">
                                Login
                            </span>
                        </>
                    )}
                </p>

                <button className="bg-blue-600 text-white py-2 rounded">
                    {state === "login" ? "Login" : "Register"}
                </button>

            </form>
        </div>
    )
}

export default Login;