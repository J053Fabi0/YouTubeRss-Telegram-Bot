import joi from "joi";

export default interface VideoInfo {
  responseContext: {
    serviceTrackingParams: [
      {
        params: [
          {
            key: string | "browse_id";
            value: string;
          }
        ];
      }
    ];
  };
}

export const videoInfoSchema = joi.object<VideoInfo>({
  responseContext: joi.object({
    serviceTrackingParams: joi.array().items(
      joi.object({
        params: joi.array().items(
          joi.object({
            key: joi.string(),
            value: joi.string().allow(""),
          })
        ),
      })
    ),
  }),
});
