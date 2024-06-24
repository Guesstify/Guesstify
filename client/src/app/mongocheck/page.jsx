"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/intro.module.scss";
import Cookies from 'js-cookie';

const Check = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
        const res = await fetch('/api/data');
        const result = await res.json();
        if (result.success) {
            setData(result.data);
        } else {
            console.error(result.error);
        }
        setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
        <h1>Data from MongoDB</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};
  

export default Check;
