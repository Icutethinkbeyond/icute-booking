import axios, { AxiosRequestConfig } from "axios";

class ApiService {
  private api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "", // ตั้งค่า base URL
    headers: {
      "Content-Type": "application/json",
    },
  });

  // GET method
  async get<T>(
    endpoint: string,
    setData?: React.Dispatch<React.SetStateAction<T>>,
    setRowCount?: React.Dispatch<React.SetStateAction<number>>,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    params?: Record<string, any>,
    signal?: AbortSignal
  ): Promise<T | void> {
    try {
      if (setLoading) setLoading(true);
      const { data } = await this.api.get(endpoint, { params, signal });

      // console.log(data)

      if (setData) setData(data.data);
      if (setRowCount && data.pagination) {
        setRowCount(data.pagination.totalItems);
      }
      return data.data;
    } catch (error: any) {
      console.error("GET Error:", error.message);
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  }


  // GET method
  async get1only<T>(
    endpoint: string,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    params?: Record<string, any>,
    signal?: AbortSignal
  ): Promise<T | void> {
    try {
      if (setLoading) setLoading(true);
      const { data } = await this.api.get(endpoint, { params, signal });

      return data;

    } catch (error: any) {
      console.error("GET Error:", error.message);
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  }

  // POST method
  async post<T>(endpoint: string, body: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.api.post(endpoint, body, config);
      return data;
    } catch (error: any) {
      console.error("POST Error:", error.message);
      throw error;
    }
  }

  // PATCH method
  async patch<T>(endpoint: string, body: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.api.patch(endpoint, body, config);
      return data;
    } catch (error: any) {
      console.error("PATCH Error:", error.message);
      throw error;
    }
  }

  // DELETE method
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.api.delete(endpoint, config);
      return data;
    } catch (error: any) {
      console.error("DELETE Error:", error.message);
      throw error;
    }
  }
}

export default new ApiService();
