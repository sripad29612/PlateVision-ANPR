import {
  useRef,
  useState,
  useEffect
} from "react";

import axios from "axios";

import {
  LayoutDashboard,
  Upload,
  Camera,
  History,
  LogOut,
  MoreVertical
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import "./App.css";

function App() {

  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [plate, setPlate] =
    useState("");

  const [history, setHistory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [cameraOn, setCameraOn] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [dashboard, setDashboard] =
    useState<any>({});

  const [graphData, setGraphData] =
    useState<any[]>([]);

  const [activePage, setActivePage] =
    useState("dashboard");

  const [menuOpen, setMenuOpen] =
    useState<number | null>(null);

  const [selectMode, setSelectMode] =
    useState(false);

  const [selectedItems, setSelectedItems] =
    useState<string[]>([]);

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  // =========================
  // FETCH HISTORY
  // =========================

  const fetchHistory = async () => {

    try {

      const response =
        await axios.get(
          "http://127.0.0.1:8000/history"
        );

      setHistory(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // FETCH DASHBOARD
  // =========================

  const fetchDashboard = async () => {

    try {

      const response =
        await axios.get(
          "http://127.0.0.1:8000/dashboard"
        );

      setDashboard(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // FETCH GRAPH
  // =========================

  const fetchGraphData = async () => {

    try {

      const response =
        await axios.get(
          "http://127.0.0.1:8000/graph-data"
        );

      if (Array.isArray(response.data)) {

        setGraphData(response.data);

      } else {

        setGraphData([]);

      }

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    fetchHistory();

    fetchDashboard();

    fetchGraphData();

  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async () => {

    try {

      const formData =
        new FormData();

      formData.append(
        "username",
        username
      );

      formData.append(
        "password",
        password
      );

      const response =
        await axios.post(

          "http://127.0.0.1:8000/login",

          formData
        );

      if (response.data.success) {

        setLoggedIn(true);

      }

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // IMAGE
  // =========================

  const handleImage = (e: any) => {

    const file =
      e.target.files[0];

    if (file) {

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );

    }

  };

  // =========================
  // DETECT
  // =========================

  const detectPlate = async () => {

    if (!image) return;

    setLoading(true);

    const formData =
      new FormData();

    formData.append(
      "file",
      image
    );

    try {

      const response =
        await axios.post(

          "http://127.0.0.1:8000/detect",

          formData
        );

      setPlate(
        response.data.plate
      );

      fetchHistory();

      fetchDashboard();

      fetchGraphData();

    } catch (error) {

      console.log(error);

    }

    setLoading(false);

  };

  // =========================
  // CAMERA
  // =========================

  const startCamera = async () => {

    const stream =
      await navigator.mediaDevices.getUserMedia({

        video: true

      });

    streamRef.current = stream;

    if (videoRef.current) {

      videoRef.current.srcObject =
        stream;

      await videoRef.current.play();

    }

    setCameraOn(true);

  };

  const stopCamera = () => {

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;

    }

    setCameraOn(false);

  };

  // =========================
  // WEBCAM DETECT
  // =========================

  const captureAndDetect =
    async () => {

      if (
        !videoRef.current ||
        !canvasRef.current
      ) return;

      setLoading(true);

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      const context =
        canvas.getContext("2d");

      if (!context) return;

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(async (blob) => {

        if (!blob) return;

        const formData =
          new FormData();

        formData.append(
          "file",
          blob,
          "webcam.jpg"
        );

        try {

          const response =
            await axios.post(

              "http://127.0.0.1:8000/detect",

              formData
            );

          setPlate(
            response.data.plate
          );

          fetchHistory();

          fetchDashboard();

          fetchGraphData();

        } catch (error) {

          console.log(error);

        }

        setLoading(false);

      });

    };

  // =========================
  // DELETE SINGLE
  // =========================

  const deleteSingle =
    async (plate: string) => {

      await axios.delete(

        `http://127.0.0.1:8000/delete/${plate}`

      );

      fetchHistory();

      fetchDashboard();

      fetchGraphData();

    };

  // =========================
  // MULTI DELETE
  // =========================
const deleteSelected = async () => {

  try {

   for (const id of selectedItems) {

  await axios.delete(
    `http://127.0.0.1:8000/delete/${id}`
  );

}

    setSelectedItems([]);
    setSelectMode(false);

    await fetchHistory();
    await fetchDashboard();
    await fetchGraphData();

  } catch (error) {

    console.log(error);

  }

};

  // =========================
  // LOGIN PAGE
  // =========================

  if (!loggedIn) {

    return (

      <div className="login-page">

        <div className="login-box">

          <h1>

            PlateVision AI

          </h1>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <button onClick={login}>
            Login
          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="layout">

      {/* SIDEBAR */}

      <div className="sidebar">

        <h2 className="logo">

          PlateVision

        </h2>

        <button
          className={
            activePage === "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage(
              "dashboard"
            )
          }
        >

          <LayoutDashboard size={20} />

          Dashboard

        </button>

        <button
          className={
            activePage === "upload"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage(
              "upload"
            )
          }
        >

          <Upload size={20} />

          Upload

        </button>

        <button
          className={
            activePage === "camera"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage(
              "camera"
            )
          }
        >

          <Camera size={20} />

          Camera

        </button>

        <button
          className={
            activePage === "history"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage(
              "history"
            )
          }
        >

          <History size={20} />

          History

        </button>

        <button
          onClick={() =>
            setLoggedIn(false)
          }
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

      {/* MAIN */}

      <div className="main-content">

        <h1 className="title">

          PlateVision AI

        </h1>

        {/* DASHBOARD */}

        {activePage ===
          "dashboard" && (

          <>

            <div className="dashboard">

              <div className="dashboard-card">

                <h2>Total Detections</h2>

                <p>

                  {dashboard.total_detections || 0}

                </p>

              </div>

              <div className="dashboard-card">

                <h2>Latest Plate</h2>

                <p>

                  {dashboard.latest_plate || "No Data"}

                </p>

              </div>

            </div>

            <div className="graph-card">

              <h2>

                Vehicle Detection Analytics

              </h2>

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <BarChart data={graphData}>

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="vehicles"
                    fill="#3b82f6"
                    radius={[10,10,0,0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </>

        )}

        {/* UPLOAD */}

        {activePage ===
          "upload" && (

          <div className="section">

            <h2>

              Upload Vehicle Image

            </h2>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

            {preview && (

              <img
                src={preview}
                className="preview"
              />

            )}

            <button
              onClick={detectPlate}
            >

              {loading
                ? "Detecting..."
                : "Detect Plate"}

            </button>

            {plate && (

              <h2 className="plate-result">

                {plate}

              </h2>

            )}

          </div>

        )}

        {/* CAMERA */}

        {activePage ===
          "camera" && (

          <div className="section">

            <h2>

              Live AI Camera

            </h2>

            {!cameraOn ? (

              <button
                onClick={startCamera}
              >

                Start Camera

              </button>

            ) : (

              <button
                onClick={stopCamera}
              >

                Stop Camera

              </button>

            )}

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="video"
            />

            <canvas
              ref={canvasRef}
              style={{
                display: "none"
              }}
            />

            <button
              onClick={
                captureAndDetect
              }
            >

              Capture & Detect

            </button>

            {plate && (

              <h2 className="plate-result">

                {plate}

              </h2>

            )}

          </div>

        )}

        {/* HISTORY */}

        {activePage ===
          "history" && (

          <>

            <div className="history-top">
              <div className="history-menu-wrapper">

  <button
    className="menu-button"
    onClick={() =>
      setMenuOpen(
        menuOpen === 999
          ? null
          : 999
      )
    }
  >
    <MoreVertical />
  </button>
{menuOpen === 999 && (

  <div className="history-menu">

    {!selectMode ? (

      <button
        onClick={() => {
          setSelectMode(true);
          setMenuOpen(null);
        }}
      >
        Select
      </button>

    ) : (

      <>
        <button
          onClick={() => {
            deleteSelected();
            setMenuOpen(null);
          }}
        >
          Delete Selected
        </button>

        <button
          onClick={() => {
            setSelectMode(false);
            setSelectedItems([]);
            setMenuOpen(null);
          }}
        >
          Cancel
        </button>
      </>

    )}

  </div>

)}

 </div>

              <input
                type="text"
                placeholder="Search Plate"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="search"
              />

              {selectMode && (

                <button
                  className="multi-delete"
                  onClick={
                    deleteSelected
                  }
                >

                  Delete Selected

                </button>

              )}

            </div>

            <div className="history">

              {history

                .filter((item) =>

                  item.plate_number
                    ?.toLowerCase()
                    .includes(
                      search.toLowerCase()
                    )

                )

                .map((item, index) => (

        <div
  className={`card ${
    selectedItems.includes(item._id)
      ? "selected-card"
      : ""
  }`}
  key={index}
  onClick={() => {

    if (!selectMode) return;

    if (
      selectedItems.includes(item._id)
    ) {

      setSelectedItems(
        selectedItems.filter(
          (p) => p !== item._id
        )
      );

    } else {

      setSelectedItems([
        ...selectedItems,
        item._id
      ]);

    }

  }}
>

                    {item.image_path && (

                      <img

                        src={`http://127.0.0.1:8000/${item.image_path}`}

                        className="history-image"

                      />

                    )}

                    <h3>

                      {
                        item.plate_number
                      }

                    </h3>

                    <p>

                      {item.time}

                    </p>

                  </div>

                ))}

            </div>

          </>

        )}

      </div>

    </div>

  );

}


export default App;