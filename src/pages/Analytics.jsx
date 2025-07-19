import React, { useEffect, useState } from "react";
import {
    Container,
    Header,
    Segment,
    Table,
    Loader,
    Message,
    Dropdown,
    Grid,
    Statistic,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;

const granularityOptions = [
    { key: "all", value: "all", text: "All Time" },
    { key: "daily", value: "daily", text: "Daily" },
    { key: "weekly", value: "weekly", text: "Weekly" },
    { key: "monthly", value: "monthly", text: "Monthly" },
];

function safeId(obj, key) {
    if (!obj) return "-";
    if (typeof obj === "string") return obj;
    if (typeof obj === "object") return obj[key] ?? JSON.stringify(obj);
    return String(obj);
}

export default function Analytics() {
    // Global totals and per-user/guest totals (no granularity)
    const [totalQuestions, setTotalQuestions] = useState(null);
    const [questionsPerUser, setQuestionsPerUser] = useState([]);
    const [questionsPerGuest, setQuestionsPerGuest] = useState([]);

    // Independent granularity states for each time-based section
    const [questionsOverTimeGranularity, setQuestionsOverTimeGranularity] = useState("daily");

    // Time series data states
    const [questionsOverTime, setQuestionsOverTime] = useState([]);

    const [error, setError] = useState(null);
    const [loadingTotals, setLoadingTotals] = useState(true);

    async function fetchJson(url) {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res.json();
    }

    // Load global totals and per-user/guest totals on mount
    useEffect(() => {
        setLoadingTotals(true);
        setError(null);
        Promise.all([
            fetchJson(`${API_BASE}/total-questions`),
            fetchJson(`${API_BASE}/questions-per-user?granularity=monthly`),
            fetchJson(`${API_BASE}/questions-per-guest?granularity=monthly`),
        ])
            .then(([totalQ, perUser, perGuest]) => {
                setTotalQuestions(totalQ.totalQuestions);
                setQuestionsPerUser(perUser);
                setQuestionsPerGuest(perGuest);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoadingTotals(false));
    }, []);

    // Load Questions Over Time data when granularity changes
    useEffect(() => {
        fetchJson(`${API_BASE}/questions-over-time?granularity=${questionsOverTimeGranularity}`)
            .then(setQuestionsOverTime)
            .catch((e) => setError(e.message))
    }, [questionsOverTimeGranularity]);

    if (error)
        return (
            <Container style={{ marginTop: 50 }}>
                <Message negative>
                    <Message.Header>Error loading analytics</Message.Header>
                    <p>{error}</p>
                </Message>
            </Container>
        );

    return (
        <Container style={{ marginTop: 30, paddingBottom: 60 }}>
            <Header as="h1" dividing>
                Analytics Dashboard
            </Header>

            {/* Total and Avg */}
            {loadingTotals ? (
                <Loader active inline="centered" size="large" style={{ marginTop: 50 }}>
                    Loading totals…
                </Loader>
            ) : (
                <Grid stackable columns={2} doubling>
                    <Grid.Column>
                        <Segment textAlign="center" raised>
                            <Statistic size="small">
                                <Statistic.Label>Total Questions Solved</Statistic.Label>
                                <Statistic.Value>{totalQuestions?.toLocaleString() ?? "-"}</Statistic.Value>
                            </Statistic>
                        </Segment>
                    </Grid.Column>
                </Grid>
            )}

            <Header as="h2" style={{ marginTop: 40 }}>
                일별 문제 업로드 수 (사진 업로드 수)
                <Dropdown
                    options={granularityOptions}
                    value={questionsOverTimeGranularity}
                    onChange={(e, { value }) => setQuestionsOverTimeGranularity(value)}
                    selection
                    compact
                    style={{ marginLeft: 15 }}
                />
            </Header>

            <Segment style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={questionsOverTime}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="_id"
                            tickFormatter={(str) => {
                                // Format date string as MM-DD or whatever you prefer
                                const date = new Date(str);
                                return `${date.getMonth() + 1}-${date.getDate()}`;
                            }}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(label) => `Date: ${label}`}
                            formatter={(value, name) => [value, name === "totalQuestions" ? "Total Questions" : name]}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalQuestions"
                            stroke="#8884d8"
                            name="인식된 문제수"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="requestCount"
                            stroke="#82ca9d"
                            name="업로드 수"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Segment>
            {/* Questions Per User (All time) */}
            <Header as="h2" style={{ marginTop: 40 }}>
                월간 회원 활동 (Top 20)
            </Header>
            <Segment style={{ overflowX: "auto" }} raised>
                <Table celled compact selectable unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>User ID</Table.HeaderCell>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Email</Table.HeaderCell>
                            <Table.HeaderCell>Subscription</Table.HeaderCell>
                            <Table.HeaderCell textAlign="right">Total Questions</Table.HeaderCell>
                            <Table.HeaderCell textAlign="right">Requests</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {questionsPerUser.map(
                            ({
                                _id,
                                userName,
                                userEmail,
                                subscriptionStatus,
                                subscriptionType,
                                totalQuestions,
                                requestCount,
                            }) => (
                                <Table.Row key={safeId(_id, "userId")}>
                                    <Table.Cell style={{ fontFamily: "monospace" }}>
                                        {safeId(_id, "userId")}
                                    </Table.Cell>
                                    <Table.Cell>{userName || "-"}</Table.Cell>
                                    <Table.Cell>{userEmail || "-"}</Table.Cell>
                                    <Table.Cell>
                                        {subscriptionType
                                            ? `${subscriptionType} (${subscriptionStatus})`
                                            : subscriptionStatus || "-"}
                                    </Table.Cell>
                                    <Table.Cell textAlign="right">{totalQuestions}</Table.Cell>
                                    <Table.Cell textAlign="right">{requestCount}</Table.Cell>
                                </Table.Row>
                            )
                        )}
                    </Table.Body>
                </Table>
            </Segment>

            {/* Questions Per Guest (All time) */}
            <Header as="h2" style={{ marginTop: 40 }}>
                월간 비회원 활동 (Top 20)
            </Header>
            <Segment style={{ overflowX: "auto" }} raised >
                <Table celled compact selectable unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Guest UUID</Table.HeaderCell>
                            <Table.HeaderCell textAlign="right">Total Questions</Table.HeaderCell>
                            <Table.HeaderCell textAlign="right">Requests</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {questionsPerGuest.map(({ _id, totalQuestions, requestCount }) => (
                            <Table.Row key={safeId(_id, "guestUUID")}>
                                <Table.Cell style={{ fontFamily: "monospace" }}>
                                    {safeId(_id, "guestUUID")}
                                </Table.Cell>
                                <Table.Cell textAlign="right">{totalQuestions}</Table.Cell>
                                <Table.Cell textAlign="right">{requestCount}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        </Container>
    );
}
