import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getReelsByFolder } from "@/database/reels";
import { Alert } from "react-native";
import { deleteFolder } from "@/database/folder"
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


interface Reel {
    id: number;
    reel_url: string;
    username: string;
    caption: string;
    thumbnail_url: string | null;
    folder_id: number;
    created_at: string;
}

export default function FolderScreen() {
    const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);

    const loadReels = async () => {
        try {
            setLoading(true);

            const data = await getReelsByFolder(
                Number(id)
            );

            setReels(data);
        } catch (error) {
            Alert.alert('ERROR','Failed to load reels')
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReels();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const handleDeleteFolder = () => {
        Alert.alert(
            "Delete Folder",
            "Are you sure you want to delete this folder? Reels inside it will not be deleted.",
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
                            await deleteFolder(Number(id));

                            router.back();
                        } catch (error) {
                            Alert.alert(
                                "ERROR",
                                "Failed to delete folder."
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
                options={{
                    headerShown: false,
                }}
            />
        
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    {name}
                </Text>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteFolder}
                >
                    <Text style={styles.deleteText}>
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>

            {/* No Reels */}
            {reels.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>
                        📂
                    </Text>

                    <Text style={styles.emptyTitle}>
                        No reels added
                    </Text>

                    <Text style={styles.emptyText}>
                        Reels saved to this folder will
                        appear here.
                    </Text>
                </View>
            ) : (

                /* Reels */
                <FlatList
                    data={reels}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.reelList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.reelCard}
                            onPress={() => {
                                router.push({
                                    pathname: "/Reel/[id]",
                                    params: {
                                        id: item.id.toString(),
                                    },
                                });

                            }}
                        >
                            {item.thumbnail_url ? (
                                <Image
                                    source={{
                                        uri: item.thumbnail_url,
                                    }}
                                    style={styles.thumbnail}
                                />
                            ) : (
                                <View style={styles.noThumbnail}>
                                    <Text style={styles.noThumbnailText}>
                                        No Image
                                    </Text>
                                </View>
                            )}

                            <View style={styles.reelInfo}>
                                <Text style={styles.username}>
                                    @{item.username}
                                </Text>

                                <Text
                                    style={styles.caption}
                                    numberOfLines={3}
                                >
                                    {item.caption || "No caption"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
    },

    back: {
        color: "#fff",
        fontSize: 30,
        marginRight: 15,
    },



    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0b0b0f",
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },

    emptyIcon: {
        fontSize: 50,
        marginBottom: 15,
    },

    emptyTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },

    emptyText: {
        color: "#777",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },

    reelList: {
        padding: 20,
    },

    reelCard: {
        flexDirection: "row",
        backgroundColor: "#17171d",
        borderRadius: 14,
        marginBottom: 12,
        overflow: "hidden",
    },

    thumbnail: {
        width: 110,
        height: 140,
        backgroundColor: "#222",
    },

    reelInfo: {
        flex: 1,
        padding: 12,
    },

    username: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 7,
    },

    caption: {
        color: "#aaa",
        fontSize: 13,
        lineHeight: 18,
    },
    noThumbnail: {
        width: 110,
        height: 140,
        backgroundColor: "#222229",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },

    noThumbnailText: {
        color: "#777",
        fontSize: 13,
        fontWeight: "500",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },

    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
        marginLeft: 15,
    },

    deleteButton: {
        marginLeft: "auto",
    },

    deleteText: {
        color: "#ff6b6b",
        fontSize: 14,
        fontWeight: "700",
    },
});