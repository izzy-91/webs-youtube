import React, { useEffect, useState } from "react";
import Main from "../components/section/Main";
import { useParams } from "react-router-dom";
import { fetchFromAPI } from "../utils/api";
import { CiBadgeDollar, CiMedal, CiRead } from "react-icons/ci";
import VideoSearch from "../components/video/VideoSearch";

const Channel = () => {
    const { channelId } = useParams();
    const [channelDetail, setChannelDetail] = useState(null); // null로 초기화
    const [channelVideo, setChannelVideo] = useState([]); // 빈 배열로 초기화
    const [loading, setLoading] = useState(true);
    const [nextPageToken, setNextPageToken] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await fetchFromAPI(
                    `channels?part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}`
                );
                setChannelDetail(data.items[0]);
                const videoData = await fetchFromAPI(`search?channelId=${channelId}&part=snippet,id&order=date`);
                // setChannelVideo(videoData?.items);
                setChannelVideo(videoData?.items || []); // videoData.items가 없으면 빈 배열로 설정
                setNextPageToken(videoData?.nextPageToken);
            } catch (error) {
                console.log("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [channelId]);

    const loadMoreVideos = async () => {
        if (nextPageToken) {
            const videosData = await fetchFromAPI(
                `search?channelId=${channelId}&part=snippet,id&order=date&pageToken=${nextPageToken}`
            );
            setChannelVideo((prevVideos) => [...prevVideos, ...videosData.items]);
            setNextPageToken(videosData?.nextPageToken);
        }
    };

    const channelPageClass = loading ? "isLoading" : "isLoaded";

    return (
        <Main title="유튜브 채널" description="유튜브 채널페이지입니다.">
            <section id="channel" className={channelPageClass}>
                {channelDetail && (
                    <div className="channel__inner">
                        <div
                            className="channel__header"
                            style={{
                                backgroundImage: `url(${channelDetail.brandingSettings.image.bannerExternalUrl})`,
                            }}
                        >
                            <div className="circle">
                                <img
                                    src={channelDetail.snippet.thumbnails.high.url}
                                    alt={channelDetail.snippet.title}
                                />
                            </div>
                        </div>
                        <div className="channel__info">
                            <h3 className="title">{channelDetail.snippet.title}</h3>
                            <p className="desc">{channelDetail.snippet.description}</p>
                            <div className="info">
                                <span>
                                    <CiBadgeDollar />
                                    {channelDetail.statistics.subscriberCount}
                                </span>
                                <span>
                                    <CiMedal />
                                    {channelDetail.statistics.videoCount}
                                </span>
                                <span>
                                    <CiRead />
                                    {channelDetail.statistics.viewCount}
                                </span>
                            </div>
                        </div>
                        <div className="channel__video video__inner search">
                            <VideoSearch videos={channelVideo} />
                        </div>
                        <div className="channel__more">
                            {nextPageToken && <button onClick={loadMoreVideos}>더 보기</button>}
                        </div>
                    </div>
                )}
            </section>
        </Main>
    );
};

export default Channel;
