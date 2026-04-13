"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";

export default function ImageUploadInput({ name, label, initialValue = "" }: { name: string, label?: string, initialValue?: string }) {
    const [url, setUrl] = useState(initialValue);
    return (
        <div style={{ marginBottom: "1rem" }}>
            <input type="hidden" name={name} value={url} />
            <ImageUpload label={label} value={url} onChange={setUrl} />
        </div>
    );
}
