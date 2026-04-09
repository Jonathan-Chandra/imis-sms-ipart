import { useEffect, useState } from "react";
import api from "../api/Client";



export default function Example() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
    api.get('/party')
      .then((res) => setData(res.data))
      .catch((error) => setData(`Error: ${error.message}`))
      .finally(() => setLoading(false));
  }, []);


    if (loading) return <p>Loading...</p>;
    if (!data) return <p>No data</p>;
    return (
        <div>
            <h1>Example Component</h1>
            <p>This component demonstrates how to use the API client.</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}