import { useState } from "react";
import { useSignUp } from "@clerk/react";

const Register = () => {
  const { signUp, isLoaded } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleRegister = async () => {
    if (!isLoaded) return;

    try {
      // 1️⃣ إنشاء الحساب
      const res = await signUp.create({
        emailAddress: email,
        password: password,
      });

      // 2️⃣ حفظ بيانات إضافية
      await signUp.update({
        unsafeMetadata: {
          role: role,
        },
      });

      // 3️⃣ تفعيل الجلسة (تسجيل دخول تلقائي)
      await signUp.setActive({
        session: res.createdSessionId,
      });

      console.log("تم إنشاء الحساب 🔥");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="doctor">Doctor</option>
      </select>

      <button onClick={handleRegister}>Create Account</button>
    </div>
  );
};

export default Register;
