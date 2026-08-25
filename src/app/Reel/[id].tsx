import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
} from "react-native";
import {
    useLocalSearchParams,
    router,
    Stack,
} from "expo-router";

import { getReelById, deleteReel } from "@/database/reels";
import { SafeAreaView } from "react-native-safe-area-context";

interface Reel {
    id: number;
    reel_url: string;
    username: string;
    caption: string;
    thumbnail_url: string | null;
    folder_id: number | null;
    created_at: string;
}

export default function ReelDetails() {
    const { id } =
        useLocalSearchParams<{ id: string }>();

    const [reel, setReel] = useState<Reel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReel();
    }, [id]);

    const loadReel = async () => {
        try {
            const data = await getReelById(Number(id));

            setReel(data);
        } catch (error) {
            Alert.alert('ERROR','Failed to load Reel')
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!reel) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>
                    Reel not found
                </Text>
            </View>
        );
    }

    const handleDeleteReel = () => {
        Alert.alert(
            "Delete Reel",
            "Are you sure you want to delete this Reel?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteReel(Number(id));

                            router.back();

                        } catch (error) {
                            Alert.alert(
                                "ERROR",
                                "Failed to delete Reel."
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <>
            <Stack.Screen 
                options={{headerShown: false}}
            />
        <SafeAreaView style={styles.container}>

            {/* Header */}

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Text style={styles.back}>
                        ←
                    </Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    Reel Details
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={
                    styles.content
                }
            >

                {/* Thumbnail */}

                {reel.thumbnail_url && (
                    <Image
                        source={{
                            uri: reel.thumbnail_url,
                        }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                )}

                {/* Username */}

                <View style={styles.section}>
                    <Text style={styles.label}>
                        Creator
                    </Text>

                    <Text style={styles.username}>
                        @{reel.username}
                    </Text>
                </View>

                {/* Caption */}

                <View style={styles.section}>
                    <Text style={styles.label}>
                        Caption
                    </Text>

                    <Text style={styles.caption}>
                        {reel.caption ||
                            "No caption available"}
                    </Text>
                </View>

                {/* Reel URL */}

                <View style={styles.section}>
                    <Text style={styles.label}>
                        Reel URL
                    </Text>

                    <Text
                        style={styles.url}
                        numberOfLines={3}
                    >
                        {reel.reel_url}
                    </Text>
                </View>

                {/* Saved Date */}

                <View style={styles.section}>
                    <Text style={styles.label}>
                        Saved
                    </Text>

                    <Text style={styles.value}>
                        {new Date(
                            reel.created_at
                        ).toLocaleString()}
                    </Text>
                </View>

                {/* Open Instagram */}

                <TouchableOpacity
                    style={styles.openButton}
                    onPress={() =>
                        Linking.openURL(
                            reel.reel_url
                        )
                    }
                >
                    <Text
                        style={
                            styles.openButtonText
                        }
                    >
                        Open Reel on Instagram
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteReel}
                >
                    <Text style={styles.deleteButtonText}>
                        Delete Reel
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0b0b0f",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },

    back: {
        color: "#fff",
        fontSize: 30,
        marginRight: 15,
    },

    headerTitle: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "700",
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    thumbnail: {
        width: "100%",
        height: 450,
        borderRadius: 16,
        backgroundColor: "#222",
        marginBottom: 25,
    },

    section: {
        marginBottom: 22,
    },

    label: {
        color: "#777",
        fontSize: 13,
        marginBottom: 7,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    username: {
        color: "#fff",
        fontSize: 19,
        fontWeight: "700",
    },

    caption: {
        color: "#ccc",
        fontSize: 15,
        lineHeight: 23,
    },

    url: {
        color: "#7c86ff",
        fontSize: 13,
        lineHeight: 19,
    },

    value: {
        color: "#ccc",
        fontSize: 14,
    },

    openButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#5865f2",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },

    openButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },

    errorText: {
        color: "#fff",
        fontSize: 16,
    },

    deleteButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#2a1518",
        borderWidth: 1,
        borderColor: "#5c252b",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
    },

    deleteButtonText: {
        color: "#ff6b6b",
        fontSize: 15,
        fontWeight: "700",
    },
});